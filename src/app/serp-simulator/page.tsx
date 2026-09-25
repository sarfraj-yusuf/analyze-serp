import { redirect, RedirectType } from 'next/navigation';

export default function SerpSimulatorPage() {
  redirect('/serp-snippet-preview', RedirectType.replace);
}
