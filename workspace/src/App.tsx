import { batch, Component, createSignal } from 'solid-js';
import { createMutable, createStore } from 'solid-js/store';

import BarGraph, { Coloring } from './bargraph';
import { Color } from './color';
const App: Component = () => {
  const data = createMutable(createSequential(40));
  const [coloring, setColoring] = createSignal<Coloring>({ default: `rgb(0, 0, 0)` });
  const execute = async (data: number[], sorter: (suite: ISortSuite) => Promise<void>) => {
    const swapColor: Color = 'rgb(50, 0, 0)';
    const compareColor: Color = 'rgb(0, 50, 0)';
    const defaultColor: Color = 'rgb(0, 0, 0)';
    const suite: ISortSuite = {
      buffers: [{
        data,
        operations: {
          async swap(i, j) {
            setColoring({ [i]: swapColor, [j]: swapColor, default: defaultColor });
            await wait(50);
            const tmp = data[i];
            data[i] = data[j];
            data[j] = tmp;
            await wait(50);
          },
          async compare(i, j) {
            setColoring({ [i]: compareColor, [j]: compareColor, default: defaultColor });
            await wait(100);
            return Math.sign(data[i] - data[j]);
          },
          async write(i, value) {
            setColoring({ [i]: swapColor, default: defaultColor });
            data[i] = value;
          },
        }
      }],
      async createBuffer(size: number) { }
    };


    await sorter(suite);
  };

  setTimeout(async () => {
    while (true) {
      console.log('start');
      await execute(data, fisherYates);
      console.log('done');
      await wait(500);
      console.log('bubble');
      await execute(data, bubble);

      await wait(100);
    }
  }, 0);

  return (
    <>
      <BarGraph data={data} coloring={coloring()} style={{ width: '100%', height: '100%', }} preserveAspectRatio='none'></BarGraph>
    </>
  );

  //display sorter props including operation and that delay and state
  //display color meaning table
};

function createSequential(length: number) {
  function* seq(length: number) {
    for (let i = 0; i < length; ++i) {
      yield (i + 1) / length;
    }
  }
  return [...seq(length)];
}

async function bubble(suite: ISortSuite) {
  const [primary] = suite.buffers;

  for (let j = primary.data.length - 1; j > 1; --j) {
    for (let i = 0; i < j; ++i) {
      if (await primary.operations.compare(i, i + 1) <= 0) {
        continue;
      }
      await primary.operations.swap(i, i + 1);
    }
  }
}

async function wait(milliseconds: number) {
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(), milliseconds);
  });
}

interface IBufferSuite { data: readonly number[]; operations: { compare: (i: number, j: number) => Promise<number>, swap: (i: number, j: number) => Promise<void>; write: (i: number, value: number) => void; }; };
interface ISortSuite { buffers: IBufferSuite[]; createBuffer(size: number): Promise<void>; };

async function fisherYates(suite: ISortSuite) {
  const [primary,] = suite.buffers;

  for (let i = primary.data.length - 1; i > 0; --i) {
    const j = Math.floor(Math.random() * (i + 1));
    await primary.operations.swap(i, j);
  }
}

export default App;
//TODO: async/await based sorter