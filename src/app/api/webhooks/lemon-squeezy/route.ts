import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Lazy initialization for build-time safety
let supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabaseAdmin;
}

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-signature");

    // Verify webhook signature
    if (!signature || !process.env.LEMON_SQUEEZY_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Missing signature or secret" },
        { status: 401 }
      );
    }

    const isValid = verifyWebhookSignature(
      rawBody,
      signature,
      process.env.LEMON_SQUEEZY_WEBHOOK_SECRET
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);
    const { meta, data } = payload;
    const eventType = meta.event_name;

    // Extract user email from the custom data
    const userEmail = meta.custom_data?.user_email;

    if (!userEmail) {
      console.error("No user email in webhook payload");
      return NextResponse.json(
        { error: "No user email provided" },
        { status: 400 }
      );
    }

    // Find user by email
    const { data: user, error: userError } = await getSupabaseAdmin()
      .from("users")
      .select("id")
      .eq("email", userEmail)
      .single();

    if (userError || !user) {
      console.error("User not found:", userEmail);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    switch (eventType) {
      case "subscription_created":
      case "subscription_updated": {
        const subscription = data.attributes;
        const status = subscription.status;
        const planVariantId = subscription.variant_id;

        // Map variant IDs to plan names (you'll need to configure these)
        const planMap: Record<string, string> = {
          // Replace with your actual Lemon Squeezy variant IDs
          starter_variant_id: "starter",
          pro_variant_id: "pro",
          team_variant_id: "team",
        };

        const planName = Object.entries(planMap).find(
          ([, plan]) => planVariantId.toString() === plan
        )?.[1] || "starter";

        // Update or create subscription record
        await getSupabaseAdmin().from("subscriptions").upsert({
          user_id: user.id,
          lemon_squeezy_id: data.id,
          status: status === "active" ? "active" : "cancelled",
          plan: planName,
          current_period_start: subscription.renews_at
            ? new Date(subscription.created_at).toISOString()
            : null,
          current_period_end: subscription.renews_at
            ? new Date(subscription.renews_at).toISOString()
            : null,
          cancel_at_period_end: subscription.cancelled,
        });

        // Update user plan
        await getSupabaseAdmin()
          .from("users")
          .update({
            plan: status === "active" ? planName : "free",
            plan_expires_at: subscription.renews_at
              ? new Date(subscription.renews_at).toISOString()
              : null,
          })
          .eq("id", user.id);

        break;
      }

      case "subscription_cancelled": {
        const subscription = data.attributes;

        // Update subscription status
        await getSupabaseAdmin()
          .from("subscriptions")
          .update({
            status: "cancelled",
            cancel_at_period_end: true,
          })
          .eq("lemon_squeezy_id", data.id);

        // If immediately cancelled (not at period end), downgrade user
        if (!subscription.ends_at || new Date(subscription.ends_at) <= new Date()) {
          await getSupabaseAdmin()
            .from("users")
            .update({
              plan: "free",
              plan_expires_at: null,
            })
            .eq("id", user.id);
        }

        break;
      }

      case "subscription_expired": {
        // Downgrade user to free plan
        await getSupabaseAdmin()
          .from("subscriptions")
          .update({
            status: "expired",
          })
          .eq("lemon_squeezy_id", data.id);

        await getSupabaseAdmin()
          .from("users")
          .update({
            plan: "free",
            plan_expires_at: null,
          })
          .eq("id", user.id);

        break;
      }

      case "subscription_payment_success": {
        // Log successful payment (optional: could track in a payments table)
        console.log("Payment successful for subscription:", data.id);
        break;
      }

      case "subscription_payment_failed": {
        // Handle failed payment (could notify user)
        console.log("Payment failed for subscription:", data.id);
        break;
      }

      default:
        console.log("Unhandled event type:", eventType);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
