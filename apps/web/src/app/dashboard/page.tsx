"use client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePrivateTest } from "@/hooks/private";

export default function Dashboard() {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();

	const { data: privateData} = usePrivateTest("User1");

	useEffect(() => {
		if (!session && !isPending) {
			router.push("/login");
		}
	}, [session, isPending]);

	if (isPending) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<h1>Dashboard</h1>
			<p>Welcome {session?.user.name}</p>
			<p>privateData: {privateData?.text}</p>
		</div>
	);
}
