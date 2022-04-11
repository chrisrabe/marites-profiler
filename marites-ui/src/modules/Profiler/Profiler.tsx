import React, { useCallback } from "react";
import { ArrowRightIcon } from "@heroicons/react/solid";
import Container from "components/common/Container";
import AppLogo from "components/common/AppLogo";
import Button from "components/ui/Button";
import Icon from "components/ui/Icon";
import Instructions from "./Instructions";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";

const Profiler: React.FC = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const router = useRouter();

  const onSubmit = useCallback(
    (data: Record<string, any>) => {
      console.log(data);
      router.push("/");
    },
    [router]
  );

  return (
    <Container>
      <AppLogo variant="profiler" />
      <Instructions />
      <div className="flex flex-col items-center justify-center space-y-5">
        <div className="w-full flex flex-col items-center">
          <input
            className="bg-white px-8 py-2 rounded border border-gray-300 outline-none text-gray-900 w-full max-w-xl text-center"
            placeholder="Enter twitter username"
            {...register("username", { required: true })}
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-2">Please enter username</p>
          )}
        </div>
        <Button variant="default_purple" onClick={handleSubmit(onSubmit)}>
          <span>Personalise</span>
          <Icon Component={ArrowRightIcon} />
        </Button>
        <Button variant="underline" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    </Container>
  );
};

export default Profiler;
