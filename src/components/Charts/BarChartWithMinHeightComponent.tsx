import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, type LabelProps } from 'recharts';

// #region Sample data
const data = [
  {
    name: 'Geofence',
    today: 4000,
    yesterday: 2400,
    amt: 2400,
  },
  {
    name: 'Crowd Surge',
    today: 3000,
    yesterday: 1398,
    amt: 2210,
  },
  {
    name: 'Bartery Average',
    today: 2000,
    yesterday: 8,
    amt: 2290,
  },
  {
    name: 'Face Matches',
    today: 2780,
    yesterday: 3908,
    amt: 2000,
  },
];

// #endregion
const renderCustomizedLabel = (props: LabelProps) => {
  const { x, y, width, value } = props;

  if (x == null || y == null || width == null) {
    return null;
  }
  const radius = 10;

  return (
    <g>
      <circle cx={Number(x) + Number(width) / 2} cy={Number(y) - radius} r={radius} fill="#8884d8" />
      <text
        x={Number(x) + Number(width) / 2}
        y={Number(y) - radius}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {String(value).split(' ')[1]}
      </text>
    </g>
  );
};

const BarChartWithMinHeightComponent = () => {
  return (
    <BarChart
      className="rjb-bar-chart"
      responsive
      data={data}
      margin={{
        top: 25,
        right: 0,
        left: 0,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis width="auto" />
      <Tooltip />
      <Legend />
      <Bar dataKey="yesterday" fill="#8884d8" minPointSize={5}>
        <LabelList dataKey="name" content={renderCustomizedLabel} />
      </Bar>
      <Bar dataKey="today" fill="#82ca9d" minPointSize={10} />
    </BarChart>
  );
};

export default BarChartWithMinHeightComponent;