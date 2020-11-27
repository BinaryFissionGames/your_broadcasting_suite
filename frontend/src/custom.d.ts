declare module '*.vue' {
    import Vue from 'vue';
    export default Vue;
}

declare module '*.svg' {
    const content: string;
    export default content;
}

declare module '*.scss' {
    const url: string;
    export default url;
}
