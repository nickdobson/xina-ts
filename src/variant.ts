import Sugar from 'sugar'

export interface XVariantProps<N> {
  label?: string
  aliases?: N[]
}

export default abstract class XVariant<N extends string> {
  readonly name: N
  readonly label: string
  readonly desc: string
  readonly aliases?: N[]

  constructor(name: N, desc: string, props?: XVariantProps<N>) {
    this.name = name
    this.desc = desc

    this.aliases = props?.aliases
    this.label =
      props?.label || name.includes('_')
        ? name
            .split('_')
            .map((word) => Sugar.String.capitalize(word))
            .join(' ')
        : name
  }

  toString() {
    return this.label
  }
}
