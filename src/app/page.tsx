import { createClient } from '@/lib/supabase/server';

export default async function Home() {
	const supabase = await createClient();
	const { data } = await supabase.auth.getUser();

	return (
		<div>
			<h1>
				Hello, {data?.user?.email ?? 'guest'}! Your user data is:
				<pre>{JSON.stringify(data, null, 2)}</pre>
			</h1>
		</div>
	);
}
