import { CheckCircle, ThumbsUp } from "lucide-react";

export default function TestResultFeedback({
  title = "Feedback Overall",
  feedback,
  icon = "checkCircle",
}) {
  const IconComponent = icon === "checkCircle" ? CheckCircle : ThumbsUp;
  const iconColor =
    icon === "checkCircle" ? "text-orange-500" : "text-blue-500";

  return (
    <div>
      <div className="flex items-center mb-4">
        <IconComponent className={`h-5 w-5 ${iconColor} mr-2`} />
        <h3 className="text-lg font-sora font-medium">{title}</h3>
      </div>

      <ul className="space-y-3">
        {feedback.map((item, index) => (
          <li key={index} className="flex">
            <span
              className={`${
                icon === "checkCircle" ? "text-orange-500" : "text-blue-500"
              } font-medium mr-2`}
            >
              {index + 1}.
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
