import { For, Index, JSX } from 'solid-js';
import { Color } from './color';

export type Coloring = { [index: number]: Color | undefined; default?: Color; };

export default (props: { data: number[], coloring: Coloring; } & JSX.SvgSVGAttributes<SVGSVGElement>) => {
    const dx = () => 1.0 / props.data.length;
    const attrs = () => {
        const { data, coloring, ...attrs } = props;
        return attrs;
    };
    return (
        <svg viewBox='0 0 1 1' {...attrs()}>
            <g transform='translate(0 1) scale(1 -1)'>
                <Index each={props.data}>
                    {(y, index) => {
                        const x = index * dx();
                        return (
                            <rect x={x} y='0' width={dx()} height={y()} style={{ fill: props.coloring[index] ?? props.coloring.default, stroke: 'none' }}></rect>
                        );
                    }}
                </Index>
            </g>
        </svg>
    );
};