const AssignmentTable = () => {
  // Mock data
  const assignments = [
    {
      id: "CII2D3",
      title: "Maths Weekly Test",
      subtitle: "Rational numbers",
      date: "25/11/2021",
      time: "11:30am - 12:30pm",
      duration: "1 hr",
      marks: 10,
      result: "A",
      resultColor: "bg-green-500",
    },
    {
      id: "CIIC2",
      title: "Maths: Mid Term Exam",
      subtitle: "Regular Syllabus",
      date: "26/09/2021",
      time: "11:30am - 1:30pm",
      duration: "2 hr",
      marks: 7,
      result: "B",
      resultColor: "bg-yellow-500",
    },
    {
      id: "CIID3",
      title: "End of Chapter 8",
      subtitle: "Operations with integers",
      date: "26/09/2021",
      time: "11:30am - 1:30pm",
      duration: "3 hr",
      marks: 7.5,
      result: "B",
      resultColor: "bg-yellow-500",
    },
    {
      id: "CII3E3",
      title: "Exam 1B",
      subtitle: "",
      date: "26/09/2021",
      time: "11:30am - 1:30pm",
      duration: "30m",
      marks: 9,
      result: "A",
      resultColor: "bg-green-500",
    },
    {
      id: "CII4I3",
      title: "Exam 2B",
      subtitle: "",
      date: "26/09/2021",
      time: "11:30am - 1:30pm",
      duration: "30m",
      marks: 8.8,
      result: "A",
      resultColor: "bg-green-500",
    },
  ];

  const columns = [
    { id: "exam", label: "Exam", width: "25%" },
    { id: "date", label: "Date & Time", width: "25%" },
    { id: "duration", label: "Duration", width: "10%" },
    { id: "marks", label: "Marks", width: "10%" },
    { id: "result", label: "Result", width: "10%" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-100">
            {columns.map((column) => (
              <th
                key={column.id}
                className="pb-3 text-left text-xs font-normal text-gray-500"
                style={{ width: column.width }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {assignments.map((assignment) => (
            <tr key={assignment.id} className="hover:bg-gray-50">
              <td className="py-4">
                <div className="flex items-start">
                  <div className="text-xs text-gray-500 w-16 shrink-0">
                    {assignment.id}
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      {assignment.title}
                    </div>
                    {assignment.subtitle && (
                      <div className="text-xs text-gray-500">
                        {assignment.subtitle}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="py-4">
                <div className="text-sm">{assignment.date}</div>
                <div className="text-xs text-gray-500">{assignment.time}</div>
              </td>
              <td className="py-4 text-sm">{assignment.duration}</td>
              <td className="py-4 text-sm">{assignment.marks}</td>
              <td className="py-4">
                <div
                  className={`w-8 h-8 rounded-full ${assignment.resultColor} text-white flex items-center justify-center text-sm font-medium`}
                >
                  {assignment.result}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssignmentTable;
