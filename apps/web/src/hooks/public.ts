import { useQuery } from '@tanstack/react-query';
import { orpc } from "@/utils/orpc";


export const usePublicTest = (name: string) =>
    useQuery(
        orpc.public.greeting.queryOptions({
            input: { name }
        })
    );
