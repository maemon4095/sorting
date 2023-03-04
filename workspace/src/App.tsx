import { batch, Component, createSignal } from 'solid-js';
import { createMutable, createStore } from 'solid-js/store';

import BarGraph, { Coloring } from './bargraph';
import { Color } from './color';
import { ISortingContext, ISortingBufferFactory, ISortingBuffer, SortingContext } from './sorter';
const App: Component = () => {
  const data = createMutable(createSequential(40));
  const defaultColoring: Coloring = { default: `rgb(255, 255, 255)`, background: `rgb(0, 0, 0)` };
  const [coloring, setColoring] = createSignal<Coloring>(defaultColoring);

  const accessColor: Color = `rgb(0, 255, 0)`;
  const accessDelay = 20;
  const writeColor: Color = `rgb(255, 0, 0)`;
  const writeDelay = 10;

  const primaryBuffer: ISortingBuffer = {
    get length() {
      return data.length;
    },
    async get(idx) {
      setColoring({ [idx]: accessColor, ...defaultColoring });
      await wait(accessDelay);
      return data[idx];
    },
    async set(idx, value) {
      setColoring({ [idx]: writeColor, ...defaultColoring });
      await wait(writeDelay);
      data[idx] = value;
      await wait(writeDelay);
    },
    async swap(i, j) {
      setColoring({ [i]: writeColor, [j]: writeColor, ...defaultColoring });
      await wait(writeDelay);
      const tmp = data[i];
      data[i] = data[j];
      data[j] = tmp;
      await wait(writeDelay);
    },
    async compare(i, j) {
      setColoring({ [i]: accessColor, [j]: accessColor, ...defaultColoring });
      await wait(accessDelay);
      return Math.sign(data[i] - data[j]);
    }
  };

  const factory: ISortingBufferFactory = {
    async create(size) {
      throw 'not supported';
    },
  };

  const context: ISortingContext = new SortingContext(primaryBuffer, factory);

  setTimeout(async () => {
    while (true) {
      console.log('start shuffling');
      await fisherYates(context);
      console.log('end   shuffling');
      await wait(100);
      console.log('start sorting');
      await insert(context);
      console.log('end   sorting');
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

async function bubble(context: ISortingContext) {
  const [primary] = context.buffers;

  for (let j = primary.length - 1; j > 1; --j) {
    for (let i = 0; i < j; ++i) {
      if (await primary.compare(i, i + 1) <= 0) {
        continue;
      }
      await primary.swap(i, i + 1);
    }
  }
}

async function insert(context: ISortingContext) {
  const [primary] = context.buffers;

  for (let j = 1; j < primary.length; ++j) {
    for (let i = j; i >= 1; --i) {
      if (await primary.compare(i - 1, i) <= 0) {
        break;
      }
      await primary.swap(i - 1, i);
    }
  }
}

async function wait(milliseconds: number) {
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(), milliseconds);
  });
}

async function fisherYates(context: ISortingContext) {
  const [primary,] = context.buffers;

  for (let i = primary.length - 1; i > 0; --i) {
    const j = Math.floor(Math.random() * (i + 1));
    await primary.swap(i, j);
  }
}

export default App;
