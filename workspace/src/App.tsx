import { batch, Component, createSignal } from 'solid-js';
import { createMutable, createStore } from 'solid-js/store';

import BarGraph, { Coloring } from './bargraph';
const App: Component = () => {
  const data = createMutable(createSequential(40));
  const [coloring, setColoring] = createSignal<Coloring>({ default: `rgb(0, 0, 0)` });
  const execute = async (data: number[], sorter: (data: number[]) => Iterator<{ type: String, left: number, right: number; }>) => {
    const iter = sorter(data);

    let next = iter.next();
    while (!next.done) {
      const op = next.value;

      setColoring({ [op.left]: `rgb(0, 50, 0)`, [op.right]: `rgb(0, 50, 0)`, default: `rgb(0, 0, 0)` });
      await wait(50);
      const tmp = data[op.left];
      data[op.left] = data[op.right];
      data[op.right] = tmp;

      await wait(50);
      console.log(op);
      next = iter.next();
    }
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

function* fisherYates(arr: number[]) {
  for (let i = arr.length - 1; i > 0; --i) {
    const j = Math.floor(Math.random() * (i + 1));
    yield swap(i, j);
  }
}

function swap(i: number, j: number) {
  return { type: 'swap', left: i, right: j };
}

function* bubble(arr: number[]) {
  for (let j = arr.length - 1; j > 1; --j) {
    for (let i = 0; i < j; ++i) {
      if (arr[i] <= arr[i + 1]) {
        continue;
      }
      yield swap(i, i + 1);
    }
  }
}

async function wait(milliseconds: number) {
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(), milliseconds);
  });
}

export default App;
//TODO: async/await based sorter