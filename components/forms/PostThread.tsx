"use client"

import * as z from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "../ui/textarea";
import {zodResolver} from "@hookform/resolvers/zod";

import { usePathname, useRouter } from "next/navigation";
import { ThreadValidationSchema } from "@/lib/validations/thread";
import { createThread } from "@/lib/actions/thread.actions";
import { useOrganization } from "@clerk/nextjs";

interface Props {
  user: {
    id: string;
    objectId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
  }
  btnTitle: string;
}

function PostThread({ userId }: { userId: string}) {
  const router = useRouter();
  const pathname = usePathname();
  const { organization } = useOrganization();

  const form = useForm({
    resolver: zodResolver(ThreadValidationSchema),
    defaultValues: {
      thread: '',
      accountId: userId,
    },
  });

  const onSubmit = async (data: z.infer<typeof ThreadValidationSchema>) => {
    await createThread({
      text: data.thread,
      author: userId,
      communityId: organization ? organization.id : null,
      path: pathname,
    });

    router.push('/');
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="mt-10 flex flex-col justify-start gap-10"
      >
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel className="text-base-semibold text-light-2">
               Content
              </FormLabel>
              <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                <Textarea
                  rows={15} 
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="bg-primary-500">Post Thread</Button>
      </form> 
    </Form> 
  );
}

export default PostThread;