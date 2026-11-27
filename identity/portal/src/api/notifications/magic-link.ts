export interface MagicLinkAlert {
  title: string;
  summary: string;
  actionUrl: string;
  event: string;
}

/**
 * Dispatches an optional zero-emoji structured Magic Link notification to ALERT_WEBHOOK_URL.
 */
export async function sendMagicLinkAlert(
  webhookUrl: string | undefined,
  alert: MagicLinkAlert
): Promise<boolean> {
  if (!webhookUrl) {
    return false;
  }

  const content = `[GITHUB-APP] ${alert.title}\nEvent: ${alert.event}\nDetails: ${alert.summary}\nAction URL: ${alert.actionUrl}`;
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, text: content }),
  });

  return response.ok;
}
