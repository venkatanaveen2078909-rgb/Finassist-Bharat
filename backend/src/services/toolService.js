import { emiCalculator } from "../tools/emiCalculator.js";

import { loanEligibility } from "../tools/loanEligibility.js";

import { fdCalculator } from "../tools/fdCalculator.js";

export const executeTool = async (
    tool,
    data
) => {

    switch (tool) {

        case "EMI":

            return emiCalculator(

                data.amount,

                data.rate,

                data.years

            );

        case "ELIGIBILITY":

            return loanEligibility(

                data.salary,

                data.obligations

            );

        case "FD":

            return fdCalculator(

                data.amount,

                data.rate,

                data.years

            );

        default:

            return null;

    }

};