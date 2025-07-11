const TimelineCell = ({ startDate, endDate, progress, dateRange }) => {
  if (!dateRange.start || !dateRange.end || !startDate || !endDate) {
    return <td className="px-3 py-2 whitespace-nowrap"></td>;
  }

  const totalDays = (dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24);
  const startOffset = (new Date(startDate) - dateRange.start) / (1000 * 60 * 60 * 24);
  const duration = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
  
  const progressColor = progress >= 100 ? 'bg-green-500' :
                      progress >= 70 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <td className="px-3 py-2 whitespace-nowrap relative h-8">
      <div 
        className="absolute top-1/2 transform -translate-y-1/2 h-3 w-full"
        style={{
          left: `${(startOffset / totalDays) * 100}%`,
          width: `${(duration / totalDays) * 100}%`
        }}
      >
        <div className="relative h-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`absolute h-full ${progressColor}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </td>
  );
};

export default TimelineCell;