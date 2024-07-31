export const dangerRegexp =
  /(SELECT|UPDATE|DELETE|INSERT|WHERE|DROP|ALTER|CREATE|EXEC|UNION|ALL|LIKE|--|<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|<[^>]+>|[$<>])/gi;
