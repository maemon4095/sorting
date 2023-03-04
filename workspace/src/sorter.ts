export interface ISortingBuffer {
    get length(): number;
    get(i: number): Promise<number>;
    set: (i: number, value: number) => void;
    compare: (i: number, j: number) => Promise<number>,
    swap: (i: number, j: number) => Promise<void>;
};
export interface ISortingContext { buffers: readonly ISortingBuffer[]; createBuffer(size: number): Promise<void>; };
export interface ISortingBufferFactory {
    create(size: number): Promise<ISortingBuffer>;
}

export class SortingContext implements ISortingContext {
    #buffers: ISortingBuffer[];
    #provider: ISortingBufferFactory;

    constructor(primaryBuffer: ISortingBuffer, provider: ISortingBufferFactory) {
        this.#buffers = [primaryBuffer];
        this.#provider = provider;
    }

    get buffers() {
        return this.#buffers;
    }
    async createBuffer(size: number): Promise<void> {
        const buf = await this.#provider.create(size);
        this.#buffers.push(buf);
    }
}
// Parallel Sortをどうするか．