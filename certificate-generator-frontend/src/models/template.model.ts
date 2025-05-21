export interface Template {
    id : string;
    name : string;
    createdAt : Date;
    updatedAt : Date;
    description : string;
    elements : TemplateElement[];
}

export interface TemplateElement {
    id : string;
    type : 'image' | 'text';
    x : number;
    y : number;
    width : number;
    height : number;
    zindex : number;
    properties : ImageProperties | TextProperties;
}

export interface ImageProperties {
    src? : string;
    opacity? : number;
}

export interface TextProperties {
    text? : string;
    fontSize? : number;
    fontFamily? : string;
    fontWeight? : string;
    color? : string;
    backgroundColor? : string;
    alignment? : string;
}

export const A4_HEIGHT = 1123;
export const A4_WIDTH = 794;