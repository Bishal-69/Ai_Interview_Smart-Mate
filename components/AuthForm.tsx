"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { signIn, signUp } from "@/lib/actions/auth.action";
import FormField from "./FormField";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (type === "sign-up") {
        const { name, email, password } = data;

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );

        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email,
          password,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success("Account created successfully. Please sign in.");
        router.push("/sign-in");
      } else {
        const { email, password } = data;

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );

        const idToken = await userCredential.user.getIdToken();
        if (!idToken) {
          toast.error("Sign in Failed. Please try again.");
          return;
        }

        await signIn({
          email,
          idToken,
        });

        toast.success("Signed in successfully.");
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      toast.error(`There was an error: ${error}`);
    }
  };

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px] max-sm:w-full max-sm:mx-4">
      <div className="flex flex-col gap-8 card py-14 px-10 max-sm:px-6 max-sm:py-10">
        {/* Logo Section - Centered */}
        <div className="flex flex-col items-center">
          <div className="flex items-center">
            <Image src="/logo.svg" alt="logo" height={48} width={48} />
            <h2 className="text-primary-100 text-3xl font-bold">SmartMate</h2>
          </div>
        </div>

        {/* Welcome Message Section - Separate */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-3">
            {isSignIn ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-light-100/70 text-base">
            {isSignIn
              ? "Sign in to continue your interview practice"
              : "Start your journey to interview success"}
          </p>
        </div>

        {/* Form Section */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 form"
          >
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Your Name"
                type="text"
              />
            )}

            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Your email address"
              type="email"
            />

            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
            />

            <Button className="btn" type="submit">
              {isSignIn ? "Sign In" : "Create an Account"}
            </Button>
          </form>
        </Form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-light-800/30"></span>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-dark-300 px-3 text-light-100/60">
              {isSignIn ? "New to SmartMate?" : "Already have an account?"}
            </span>
          </div>
        </div>

        {/* Switch Account Link */}
        <div className="text-center">
          <Link
            href={!isSignIn ? "/sign-in" : "/sign-up"}
            className="text-primary-200 hover:text-primary-100 font-semibold text-base transition-colors duration-200"
          >
            {!isSignIn ? "Sign in to your account" : "Create a new account"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
