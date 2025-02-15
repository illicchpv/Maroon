export interface AccordionType {
    title: string
    body: string
}

export interface ProductType {
    id: number
    image: string
    name: string
    title: string
    description: string
    accordion: AccordionType[]
    volume: string
    price: number
}
