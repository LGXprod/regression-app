import { Chart } from "react-chartjs-2";
import useSampleDataStore from "../stores/useSampleDataStore";
import useMenuOptionsStore from "../stores/useMenuOptionsStore";
import useRegressionOutputStore from "../stores/useRegressionStore";

const chartScaleOptions = {
  grid: {
    display: false,
  },
  border: {
    display: false,
  },
  ticks: {
    color: "#EEEEEE",
  },
};

const RegressionChart = () => {
  const dataGeneratorType = useMenuOptionsStore(
    (state) => state.dataGeneratorType
  );
  const sampleData = useSampleDataStore((state) => state.sampleData);
  const regressionOutput = useRegressionOutputStore(
    (state) => state.regressionOutput
  );

  return (
    <div className="w-full min-h-[300px] h-[480px]">
      {sampleData && regressionOutput && (
        <Chart
          type="scatter"
          options={{
            scales: {
              x: {
                min: sampleData.axisBounds.mins.x,
                max: sampleData.axisBounds.maxs.x,
                title: {
                  text: "X Samples",
                  display: true,
                  color: "#EEEEEE",
                },
                ...chartScaleOptions,
              },
              y: {
                min: sampleData.axisBounds.mins.y,
                max: sampleData.axisBounds.maxs.y,
                title: {
                  text: "Y = F(X)",
                  display: true,
                  color: "#EEEEEE",
                },
                ...chartScaleOptions,
              },
            },
            plugins: {
              legend: {
                labels: {
                  color: "#EEEEEE",
                },
              },
            },
            responsive: true,
            maintainAspectRatio: false,
          }}
          data={{
            datasets: [
              {
                label: "Random Samples",
                data: sampleData.testSet,
                backgroundColor: "#48BFE3",
              },
              {
                label: `${dataGeneratorType.toUpperCase()} Function`,
                data: regressionOutput.predictions,
                backgroundColor: "#F72585",
                tension: 0.4,
                borderColor: "#F72585",
                borderWidth: 4,
                type: "line" as const,
                pointRadius: 0,
              },
            ],
          }}
        />
      )}
    </div>
  );
};

export default RegressionChart;
