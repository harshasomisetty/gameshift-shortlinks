import { redirect } from 'next/navigation';

export default async function ShortLinkRedirect({
  params,
}: {
  params: { shortcode: string };
}) {
  const { shortcode } = params;
  if (!shortcode) {
    redirect('/');
  }
  redirect(`${process.env.API_BASE_URL}/${shortcode}`);
}
