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
import { Input } from "../ui/input";
import {zodResolver} from "@hookform/resolvers/zod";

import { usePathname, useRouter } from "next/navigation";
import { CommentValidationSchema } from "@/lib/validations/thread";
import { addCommentToThread } from "@/lib/actions/thread.actions";
import Image from "next/image";

interface Props {
  threadId: string;
  currentUserImg: string;
  currentUserId: string;
}

const Comment = ({ threadId, currentUserImg, currentUserId}: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  
  const form = useForm({
    resolver: zodResolver(CommentValidationSchema),
    defaultValues: {
      thread: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof CommentValidationSchema>) => {
    await addCommentToThread(
      threadId,
      data.thread,
      currentUserId,
      pathname
    );

    form.reset();
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="comment-form"
      >
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 w-full">
              <FormLabel>
               <Image 
                src={currentUserImg}
                alt="Profile Image"
                width={48}
                height={48}
                className="rounded-full object-contain"
               />
              </FormLabel>
              <FormControl className="border-none bg-transparent">
                <Input
                  type="text" 
                  placeholder="Write a comment..."
                  className="no-focus text-light-1 outline-none"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="comment-form_btn">Reply</Button>
      </form> 
    </Form> 
  );
}

export default Comment;