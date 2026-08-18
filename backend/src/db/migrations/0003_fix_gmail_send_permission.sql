UPDATE "connected_accounts"
SET "permissions" = CASE
  WHEN "permissions"::jsonb ? 'send' THEN "permissions"
  ELSE "permissions"::jsonb || '["send"]'::jsonb
END
WHERE "provider" = 'gmail';
