import { motion } from 'framer-motion';

const StepProject = ({ steps, currentStep }) => {
  return (
    <div className="w-full h-full p-4 bg-gray-50 border-r border-gray-200 overflow-y-auto">
      <div className="flex flex-col items-center w-full">
        {/* Steps container */}
        <div className="relative flex flex-col items-center w-full max-w-md">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isActive = stepNumber === currentStep;
            const isLast = stepNumber === steps.length;
            const showLine = index < steps.length - 1;

            return (
              <div key={index} className="relative w-full flex flex-col items-center">
                {/* Card step */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-start w-full p-4 rounded-lg border transition-all mb-2
                    ${isActive 
                      ? 'border-blue-400 bg-blue-50 shadow-sm' 
                      : isCompleted 
                      ? 'border-green-100 bg-green-50' 
                      : 'border-gray-200 bg-white'
                    }`}
                >
                  <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full mt-0.5 mr-3 text-base font-medium
                    ${
                      isActive
                        ? 'bg-blue-500 text-white'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }
                  ">
                    {isCompleted ? '✓' : stepNumber}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-base font-medium ${
                      isActive ? 'text-blue-700' : 'text-gray-800'
                    }`}>
                      {step.label}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {step.description || 'Description will appear here'}
                    </p>
                  </div>
                </motion.div>

                {/* Line between steps */}
                {showLine && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{
                      height: 24,
                      backgroundColor:
                        stepNumber < currentStep
                          ? '#34d399' // green-400
                          : stepNumber === currentStep
                          ? '#60a5fa' // blue-400
                          : '#d1d5db', // gray-300
                    }}
                    transition={{ duration: 0.4 }}
                    className="w-0.5 rounded-full my-1"
                  />
                )}

                {/* Last step warning */}
                {isLast && isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-2 text-xs text-red-600 font-medium text-center px-4 py-1 bg-red-50 rounded"
                  >
                    ⚠️ Vui lòng kiểm tra kỹ thông tin trước khi xử lý!
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepProject;