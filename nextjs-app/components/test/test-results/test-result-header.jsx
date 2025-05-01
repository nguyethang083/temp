import Link from "next/link";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function TestResultHeader({ title, status, breadcrumbs }) {
  return (
    <div>
      <div className="flex items-center text-sm text-muted-foreground mb-2">
        {breadcrumbs.map((item, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && <span className="mx-2">&gt;</span>}
            {item.href ? (
              <Link href={item.href} className="text-blue-500 hover:underline">
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center">
        <h1 className="text-2xl font-sora font-bold">{title}</h1>
        <div className="ml-3">
          {status === "passed" && (
            <CheckCircle className="h-6 w-6 text-green-500" />
          )}
          {status === "failed" && <XCircle className="h-6 w-6 text-red-500" />}
          {status === "pending" && (
            <Clock className="h-6 w-6 text-yellow-500" />
          )}
        </div>

        {/* Add a more prominent pass/fail indicator */}
        <div className="ml-4">
          {status === "passed" && (
            <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
              Passed
            </span>
          )}
          {status === "failed" && (
            <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
              Failed
            </span>
          )}
          {status === "pending" && (
            <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
              Pending
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
