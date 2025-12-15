/**
 * Mixpanel Browser Type Definitions
 * Extended type declarations for mixpanel-browser
 */

declare module 'mixpanel-browser' {
  interface Config {
    debug?: boolean;
    track_pageview?: boolean | 'url-with-path' | 'url-with-path-and-query-string';
    persistence?: 'localStorage' | 'cookie';
    secure_cookie?: boolean;
    cross_subdomain_cookie?: boolean;
    cookie_expiration?: number;
    store_google?: boolean;
    save_referrer?: boolean;
    test?: boolean;
    verbose?: boolean;
    img?: boolean;
    track_links_timeout?: number;
    cookie_domain?: string;
    upgrade?: boolean;
    disable_persistence?: boolean;
    disable_cookie?: boolean;
    api_host?: string;
    app_host?: string;
    cdn?: string;
    ignore_dnt?: boolean;
    batch_requests?: boolean;
    batch_size?: number;
    batch_flush_interval_ms?: number;
    batch_request_timeout_ms?: number;
    hooks?: {
      before_send_events?: (data: unknown) => unknown;
    };
    ip?: boolean;
    property_blacklist?: string[];
    xhr_headers?: Record<string, string>;
  }

  interface People {
    set(prop: string | Record<string, unknown>, value?: unknown): void;
    set_once(prop: string | Record<string, unknown>, value?: unknown): void;
    unset(prop: string | string[]): void;
    increment(prop: string | Record<string, number>, value?: number): void;
    append(prop: string | Record<string, unknown>, value?: unknown): void;
    union(prop: string | Record<string, unknown[]>, value?: unknown[]): void;
    track_charge(amount: number, properties?: Record<string, unknown>): void;
    clear_charges(): void;
    delete_user(): void;
  }

  interface Mixpanel {
    init(token: string, config?: Config, name?: string): Mixpanel;
    push(item: [string, ...unknown[]]): void;
    disable(events?: string[]): void;
    track(
      event_name: string,
      properties?: Record<string, unknown>,
      optionsOrCallback?: Record<string, unknown> | (() => void),
      callback?: () => void
    ): void;
    track_links(
      query: string,
      event_name: string,
      properties?: Record<string, unknown> | (() => Record<string, unknown>)
    ): void;
    track_forms(
      query: string,
      event_name: string,
      properties?: Record<string, unknown> | (() => Record<string, unknown>)
    ): void;
    time_event(event_name: string): void;
    register(properties: Record<string, unknown>, days?: number): void;
    register_once(
      properties: Record<string, unknown>,
      default_value?: unknown,
      days?: number
    ): void;
    unregister(property: string): void;
    identify(unique_id: string): void;
    alias(alias: string, original?: string): void;
    reset(): void;
    get_distinct_id(): string;
    opt_in_tracking(options?: { track?: boolean; persistence_type?: string }): void;
    opt_out_tracking(options?: { delete_user?: boolean; persistence_type?: string }): void;
    has_opted_in_tracking(options?: { persistence_type?: string }): boolean;
    has_opted_out_tracking(options?: { persistence_type?: string }): boolean;
    clear_opt_in_out_tracking(options?: { persistence_type?: string }): void;
    get_property(property_name: string): unknown;
    get_group(group_key: string, group_id: string): Group;
    set_group(group_key: string, group_ids: string | string[]): void;
    add_group(group_key: string, group_id: string): void;
    remove_group(group_key: string, group_id: string): void;
    track_with_groups(
      event_name: string,
      properties?: Record<string, unknown>,
      groups?: Record<string, string | string[]>
    ): void;
    people: People;
  }

  interface Group {
    set(prop: string | Record<string, unknown>, value?: unknown): void;
    set_once(prop: string | Record<string, unknown>, value?: unknown): void;
    unset(prop: string | string[]): void;
    union(prop: string | Record<string, unknown[]>, value?: unknown[]): void;
    remove(prop: string | Record<string, unknown>, value?: unknown): void;
    delete_group(): void;
  }

  const mixpanel: Mixpanel;
  export default mixpanel;
  export { Mixpanel, Config, People, Group };
}
