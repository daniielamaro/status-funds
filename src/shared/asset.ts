export class Asset {

    code: string = "";
    name: string = "";
    percentWallet: number | undefined;
    percentVariation: number = 0;
    amount: number = 0;
    lastQuotation: number = 0;
    lastDividend: number = 0;
    paymentDate: string = "";

    constructor(code: string, name: string, amount: number){
        this.code = code;
        this.name = name;
        this.amount = amount;
    }
}