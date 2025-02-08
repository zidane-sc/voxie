"use client"

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SignOutButton, SignedIn, SignedOut, SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";

import { sidebarLinks } from "@/constants";
import { currentUser } from "@clerk/nextjs/server";

const LeftSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { userId } = useAuth();

  return (
    <section className='custom-scrollbar leftsidebar'>
      <div className='flex w-full flex-1 flex-col gap-6 px-6'>
        {sidebarLinks.map((link) => {
          const isActive =
            (pathname.includes(link.route) && link.route.length > 1) ||
            pathname === link.route;

          if (link.route === "/profile") {
            if (!userId) {
              return null;
            } else {
              link.route = `${link.route}/${userId}`;
            }
          }

          return (
            <Link
              href={link.route}
              key={link.label}
              className={`leftsidebar_link ${isActive && "bg-primary-500 "}`}
            >
              <Image
                src={link.imgURL}
                alt={link.label}
                width={24}
                height={24}
              />

              <p className='text-light-1 max-lg:hidden'>{link.label}</p>
            </Link>
          );
        })}
      </div>

      <div className='mt-10 px-6'>
        <SignedIn>
          <SignOutButton redirectUrl="/sign-in">
              <div className="flex cursor-pointer gap-4 p-4">
                <Image 
                  src="/assets/logout.svg" 
                  alt="logout" 
                  width={24} 
                  height={24}
                />

              <p className='text-light-2 max-lg:hidden'>Logout</p>
            </div>
          </SignOutButton>
        </SignedIn>

        <SignedOut>
          <SignInButton>
            <div className="flex cursor-pointer gap-4 p-4 text-light-1">
              <Image 
                src="/assets/sign-in.png" 
                alt="login" 
                width={24} 
                height={24}
                className="invert"
              />

              <p className='text-light-2 max-lg:hidden'>Sign in</p>
            </div>
          </SignInButton>

          <SignUpButton>
            <div className="flex cursor-pointer gap-4 p-4">
              <Image 
                src="/assets/sign-up.png" 
                alt="signup" 
                width={24} 
                height={24}
                className="invert"
              />

              <p className='text-light-2 max-lg:hidden'>Sign up</p>
            </div>
          </SignUpButton>
        </SignedOut>
      </div>
    </section>
  );
};

export default LeftSidebar;