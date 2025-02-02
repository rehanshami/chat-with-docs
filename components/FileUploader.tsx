"use client";
import { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  CheckCircleIcon,
  CircleArrowDown,
  HammerIcon,
  RocketIcon,
  SaveIcon,
} from "lucide-react";
import useUpload, { Status, StatusText } from "@/hooks/useUpload";
import { useRouter } from "next/navigation";
import useSubscription from "@/hooks/useSubscription";
import { toast, useToast } from "@/hooks/use-toast";

function FileUploader() {
  const { progress, status, fileId, handleUpload } = useUpload();
  const { isOverFileLimit, filesLoading } = useSubscription();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (fileId) {
      router.push(`/dashboard/files/${fileId}`);
      console.log("fileid", fileId);
    }
  }, [fileId, router]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Do something with the files
      const file = acceptedFiles[0];
      if (file) {
        // await handleUpload function
        if (file) {
          if (!isOverFileLimit && !filesLoading) {
            console.log("Uploading file:", file.name);
            await handleUpload(file);
          } else {
            toast({
              variant: "destructive",
              title: "Free plan file limit reached",
              description:
                "You have reached the maximum number of file uploads for your account. Please upgrade to Pro for more uploads.",
            });
          }
        }
      } else {
        // do nothing..
        // toast
        console.error("No file selected");
      }
    },
    [handleUpload, filesLoading, isOverFileLimit, toast]
  );

  const statusIcons: Record<Status, JSX.Element> = {
    [StatusText.UPLOADING]: (
      <RocketIcon className="h-20 w-20 text-indigo-600" />
    ),
    [StatusText.UPLOADED]: (
      <CheckCircleIcon className="h-20 w-20 text-indigo-600" />
    ),
    [StatusText.SAVING]: <SaveIcon className="h-20 w-20 text-indigo-600" />,
    [StatusText.GENERATING]: (
      <HammerIcon className="h-20 w-20 text-indigo-600 animate-bounce" />
    ),
  };

  const { getRootProps, getInputProps, isDragActive, isFocused, isDragAccept } =
    useDropzone({
      onDrop,
      maxFiles: 1,
      accept: {
        "application/pdf": [".pdf"],
      },
    });

  const uploadInProgress = progress != null && progress >= 0 && progress <= 100;
  return (
    <div className="flex flex-col gap-4 items-center max-w-7xl mx-auto">
      {/* Loading */}
      {uploadInProgress && (
        <div className="mt-32 flex flex-col justify-center items-center gap-5">
          <div
            className={`radial-progress bg-indigo-300 text-white border-indigo-600 border-4 ${
              progress === 100 && "hidden"
            }`}
            role="progressbar"
            style={
              {
                "--value": progress,
                "--size": "12rem",
                "--thickness": "1.3rem",
              } as React.CSSProperties
            }
          >
            {progress}%
          </div>

          {/* Render status icon */}
          {status && statusIcons[status]}

          <p className="text-indigo-600 animate-pulse">{status ?? ""}</p>
        </div>
      )}
      {!uploadInProgress && (
        <div
          {...getRootProps()}
          className={`p-10 border-2 border-dashed mt-10 w-[90%] border-indigo-600 text-indigo-600 rounded-lg h-96 flex items-center justify-center ${
            isFocused || isDragAccept ? "bg-indigo-300" : "bg-indigo-100"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center">
            {isDragActive ? (
              <>
                <RocketIcon className="h-20 w-20 animate-ping" />
                <p>Drop the files here ...</p>
              </>
            ) : (
              <>
                <CircleArrowDown className="h-20 w-20 animate-bounce" />
                <p>
                  Drag &apos;n&apos; drop some files here, or click to select
                  files
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUploader;
