import { redirect, RedirectType } from 'next/navigation';

export default function LinkInspectorPage() {
  redirect('/affiliate-link-checker', RedirectType.replace);
}
