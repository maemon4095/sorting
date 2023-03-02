export interface IBufferSuite { data: readonly number[]; operations: { compare: (i: number, j: number) => Promise<number>, swap: (i: number, j: number) => Promise<void>; write: (i: number, value: number) => void; }; };
export interface ISortingContext { buffers: readonly IBufferSuite[]; createBuffer(size: number): Promise<void>; };

export class SortingContext implements ISortingContext {
    #buffers: IBufferSuite[];

    constructor(primaryBuffer: IBufferSuite) {
        this.#buffers = [primaryBuffer];
    }

    get buffers() {
        return this.#buffers;
    }
    async createBuffer(size: number): Promise<void> {
        this.buffers.push();
    }
}

type ParamOf<T> = T extends (...args: infer X) => any ? X : never;

export type BufferOperationHooks = {
    [key in keyof IBufferSuite['operations']as `before${Capitalize<key>}`]?: (...args: ParamOf<IBufferSuite['operations'][key]>) => Promise<void>;
} & {
        [key in keyof IBufferSuite['operations']as `after${Capitalize<key>}`]?: (...args: ParamOf<IBufferSuite['operations'][key]>) => Promise<void>;
    };

export class BufferSuite implements IBufferSuite {
    #hooks: BufferOperationHooks;
    #data: number[];
    #operations: IBufferSuite['operations'] = {
        swap: async (i, j) => {
            await this.#hooks.beforeSwap?.(i, j);
            this.#data[i];
            await this.#hooks.afterSwap?.(i, j);
        },
        compare: async (i, j) => {
            await this.#hooks.beforeCompare?.(i, j);
            const ret = Math.sign(this.#data[i] - this.#data[j]);
            await this.#hooks.afterCompare?.(i, j);
            return ret;
        },
        write: async (i, value) => {
            await this.#hooks.beforeWrite?.(i, value);
            this.#data[i] = value;
            await this.#hooks.afterWrite?.(i, value);
        }
    };

    constructor(data: readonly number[], hooks?: BufferOperationHooks) {
        this.#data = [...data];
        this.#hooks = hooks ?? {};
    }

    get data() {
        return this.#data;
    }
    get operations() {
        return this.#operations;
    };
}