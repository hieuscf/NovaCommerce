export async function persistAccessTokenCookie(
  accessToken: string,
): Promise<void> {
  await fetch('/api/auth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accessToken }),
  });
}

export async function removeAccessTokenCookie(): Promise<void> {
  await fetch('/api/auth/token', {
    method: 'DELETE',
  });
}
