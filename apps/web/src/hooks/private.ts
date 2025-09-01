import { useQuery } from '@tanstack/react-query';
import {orpc} from "@/utils/orpc";


export const usePrivateTest = (name: string) =>
    useQuery(
        orpc.private.greeting.queryOptions({
            input: { name }
        })
    );
