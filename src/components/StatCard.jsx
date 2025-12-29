const StatCard = ({ icon: Icon, title, value, subtitle }) => {
  return (
    <div className="bg-[#0b1f26] border border-teal-500/30 rounded-xl p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3 text-teal-400">
        <div className="p-2 rounded-lg bg-teal-500/20">
          <Icon size={20} />
        </div>
        <span className="font-medium">{title}</span>
      </div>

      <div className="text-4xl font-bold text-teal-300">
        {value}
      </div>

      <div className="text-gray-400 text-sm">
        {subtitle}
      </div>
    </div>
  );
};

export default StatCard;
