import { createEffect, Index, JSX, splitProps } from 'solid-js';
import { Color } from './color';

export type Coloring = { [index: number]: Color | undefined; default?: Color; background: Color, };

export default (props: { data: number[], coloring: Coloring; } & JSX.SvgSVGAttributes<SVGSVGElement>) => {
    const dx = () => 1.0 / props.data.length;
    const [model, attrs] = splitProps(props, ['data', 'coloring']);
    const [styles, others] = splitProps(attrs, ['style']);
    const style = () => styles.style instanceof String ? {} : styles.style as JSX.CSSProperties;
    return (
        <svg viewBox='0 0 1 1' {...others} style={{ "background-color": model.coloring.background, ...style(), }}>
            <g transform='translate(0 1) scale(1 -1)'>
                <Index each={model.data}>
                    {(y, index) => {
                        const x = index * dx();
                        return (
                            <rect x={x} y='0' width={dx()} height={y()} style={{ fill: model.coloring[index] ?? props.coloring.default, stroke: 'none' }}></rect>
                        );
                    }}
                </Index>
            </g>
        </svg>
    );
};