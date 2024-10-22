import { redirect } from 'next/navigation';
import { API_BASE_URL } from '../api/links/route';

export default async function ShortLinkRedirect({
  params,
}: {
  params: { shortcode: string };
}) {
  const { shortcode } = params;
  if (!shortcode) {
    redirect('/');
  }
  redirect(`${API_BASE_URL}/${shortcode}`);
}
