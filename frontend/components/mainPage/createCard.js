"use client";

function CreateCard({ icon, title, description, gradientFrom, gradientTo }) {
  return (
    <div className="feature flex flex-col rounded-t-lg shadow-lg bg-gray-800 w-full md:w-auto">
      <div className="p-6 flex-1 flex flex-col items-center text-center">
        <div className="flex items-center justify-center mb-4 space-x-4">
          <img src={icon} alt={`${title} Icon`} className="w-15 h-12" />
          <h3 className="text-2xl font-bold">{title}</h3>
        </div>
        <p>{description}</p>
      </div>

      <div
        className={`h-1 bg-gradient-to-r from-${gradientFrom} to-${gradientTo} rounded-b-lg`}
      ></div>
    </div>
  );
}

export default CreateCard;
