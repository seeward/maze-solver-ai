
export type palette = {
    0: number,
    1: number,
    2: number,
    3: number,
    4: number,
    5: number,
    6: number,
    7: number,
    8: number,
    9: number,
    A: number,
    B: number,
    C: number,
    D: number,
    E: number,
    F: number
}

export type paletteStr = {
    0: string,
    1: string,
    2: string,
    3: string,
    4: string,
    5: string,
    6: string,
    7: string,
    8: string,
    9: string,
    A: string,
    B: string,
    C: string,
    D: string,
    E: string,
    F: string
}
export function fetchPalette(opt: number): palette {
    switch (opt) {
        case 0:
            return {
                0: 0x000000,
                1: 0x9D9D9D,
                2: 0xFFFFFF,
                3: 0xBE2633,
                4: 0xE06F8B,
                5: 0x493C2B,
                6: 0xA46422,
                7: 0xEB8931,
                8: 0xF7E26B,
                9: 0x2F484E,
                A: 0x44891A,
                B: 0xA3CE27,
                C: 0x1B2632,
                D: 0x005784,
                E: 0x31A2F2,
                F: 0xB2DCEF
            }
        case 1:
            return {
                0: 0x000000,
                1: 0xffffff,
                2: 0x8b4131,
                3: 0x7bbdc5,
                4: 0x8b41ac,
                5: 0x6aac41,
                6: 0x3931a4,
                7: 0xd5de73,
                8: 0x945a20,
                9: 0x5a4100,
                A: 0xbd736a,
                B: 0x525252,
                C: 0x838383,
                D: 0xacee8b,
                E: 0x7b73de,
                F: 0xacacac
            }

    }

}
export function fetchPaletteAsString(opt: number): paletteStr {
    switch (opt) {
        case 0:
            return {
                0: '#000',
                1: '#9D9D9D',
                2: '#FFF',
                3: '#BE2633',
                4: '#E06F8B',
                5: '#493C2B',
                6: '#A46422',
                7: '#EB8931',
                8: '#F7E26B',
                9: '#2F484E',
                A: '#44891A',
                B: '#A3CE27',
                C: '#1B2632',
                D: '#005784',
                E: '#31A2F2',
                F: '#B2DCEF'
            }
        case 1:
            return {
                0: '#c1c1c1',
                1: '#fff',
                2: '#8b4131',
                3: '#7bbdc5',
                4: '#8b41ac',
                5: '#6aac41',
                6: '#3931a4',
                7: '#d5de73',
                8: '#945a20',
                9: '#5a4100',
                A: '#bd736a',
                B: '#525252',
                C: '#838383',
                D: '#acee8b',
                E: '#7b73de',
                F: '#acacac'
            }
        case 2:

            return {
                0: '#000',
                1: '#fff',
                2: '#8b4131',
                3: '#7bbdc5',
                4: '#8b41ac',
                5: '#6aac41',
                6: '#3931a4',
                7: '#d5de73',
                8: '#945a20',
                9: '#5a4100',
                A: '#bd736a',
                B: '#525252',
                C: '#838383',
                D: '#acee8b',
                E: '#7b73de',
                F: '#acacac'
            }
    }
}
export function fetchColorCodeFromColor(color: number, pall: palette): any {

    let t = '.'
    Object.keys(pall).forEach((eachPalKey) => {
        if (pall[eachPalKey] == color) {
            t = eachPalKey
        }
    })
    return t
}
export function fetchColorFromCode(code: string, pal: palette): number | string {
    if(code == '.'){
        return code;
    }
    return pal[code];
}