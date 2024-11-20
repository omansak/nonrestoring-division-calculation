(function () {
  "use strict";

  /**
   * To normalize fraction binary
   * Example :
   * if length = 4 then
   * 01 = 0001.0000
   * 01.10 = 0001.1000
   * 11.10 = 1111.1000
   * .001  = 0000.0010
   */
  const normalize = (binary = "0.0", length = 1) => {
    const signBit = binary[0] == "." ? "0" : binary[0]; // .01 = 00.01

    // Check fraction
    if (!binary.includes(".")) {
      binary = `${binary.padStart(length, signBit)}.${Array.from({ length: length })
        .map(() => "0")
        .join("")}`;
    }

    const [integer, fraction] = binary.split("."); // Divide integer and fraction part

    // TODO Slice to overflow bits
    const fractionPart = fraction.padEnd(length, "0"); // Fill zero to length

    const integerPart = integer.slice(length - binary.length).padStart(length, signBit);

    return `${integerPart}.${fractionPart}`;
  };

  /**
   * To complement fraction binary
   * Example :
   * if length = 4 then
   * In integer part most significant bit (MSB) is equals -1 or 0, others are 1 or 0
   * 01     (1) = 1111        (-1)    = 2^3*-1 + 2^2*1 + 2^1*1 + 2^0*1 = -8 + 4 + 2 + 1 = -1
   * 0101   (5) = 1011        (-5)    = 2^3*-1 + 2^2*0 + 2^1*1 + 2^0*1 = -8 + 0 + 2 + 1 = -5
   * 01.10  (1.5) = 1110.1000 (-1.5)  = 2^3*-1 + 2^2*1 + 2^1*1 + 2^0*0 = -8 + 4 + 2 + 0 = -2, 1/2^1*1 = 0.5, -2 + 0.5 = -1.5
   * 11.10  (3.5) = 1100.1000 (-3.5)  = 2^3*-1 + 2^2*1 = -8 + 4 = -4, 1/2^1*1 = 0.5, -4 + 0.5 = -3,5
   * so algorithm is
   * if fraction part has any 1 bit
   *    - 1's complement(integer part) . 2's complement(fraction part)
   * if fraction part has no any 1 bit
   *    - 2's complement(integer part) . fill zero
   *
   */
  const complement = (binary = "0.0", length = 1) => {
    binary = normalize(binary, length);

    const [integer, fraction] = binary.split("."); // Divide integer and fraction part
    const idx = fraction.lastIndexOf("1");
    let complementInteger = [];
    let complementFraction = [];

    // Flip all bits
    for (let i = 0; i < length; i++) {
      complementInteger += integer[i] == "0" ? "1" : "0";

      if (idx >= 0 && i <= idx) {
        complementFraction += fraction[i] == "0" ? "1" : "0";
      } else {
        complementFraction += "0";
      }
    }

    if (fraction.includes("1")) {
      const _1 = Array.from({ length: length })
        .map((_, index) => (index == idx ? "1" : "0"))
        .join("");

      return calculate(`${complementInteger}.${complementFraction}`, normalize(`0.${_1}`, length), length, 2);
    } else {
      return calculate(complementInteger, "01", length, 2);
    }
  };

  /**
   * Addition 2 numbers with any base
   */
  const calculate = (number = "0.0", number2 = "0.0", length = 1, base = 2) => {
    number = normalize(number, length).split("");
    number2 = normalize(number2, length).split("");

    /*
      loop until can iterate and carry is not zero
        carry := number[i] + number1[i] - Carry can be greater than 'base'
        result[i] = carry mod base - Remainder
        carry = non-fractional-part(carry / base) - Quotient

      ***PS***
      arr: [3,2,4]
      index = 0 -> 3 in programming (In programming index starts 0 to length -1 from left to right)
      index = 1 -> 4 in math (In math index starts 1 to length from right to left)

      Option 1 => Starts index from 0 and reverse array and iterate with +1
      Option 2 => Start index = array length -1 and iterate with -1
    */

    let res = [];
    let carry = 0;
    let i = length * 2; // (length * 2 + 1) = length with fraction 0000.0000 => string size = 9 but last index = 8

    while (i >= 0) {
      if (number[i] != "." && number2[i] != ".") {
        if (i >= 0) {
          carry += parseInt(number[i]);
          carry += parseInt(number2[i]);
        }
        res.push(carry % base);
        carry = Math.trunc(carry / base);
      }
      i--;
    }

    res.reverse().splice(length, 0, ".");
    return res.join("");
  };

  /* = Math.sign()
    const getSign = (e) => {
      return e > 0 ? 1 : e < 0 ? -1 : 0;
    };
  */

  const convertDecimalToBinary = (decimal = 0, length = 1) => {
    const d = Math.abs(decimal);
    const b = d.toString(2);
    const [integer, fraction] = b.split(".");

    let res;
    if (fraction) {
      res = normalize(`${integer.padStart(length, 0)}.${fraction.padEnd(length, 0)}`, length);
    } else {
      res = normalize(integer.padStart(length, decimal > 0 ? "0" : "1"), length);
    }

    if (decimal < 0) {
      return complement(res, length);
    }

    return res;
  };

  const convertBinaryToDecimal = (binary = "0.0", length = 1) => {
    binary = normalize(binary);
    const [integer, fraction] = binary.split(".");

    const integerTotal = integer
      .split("")
      .reverse()
      .reduce((acc, cur, idx) => {
        let multiply = idx == integer.length - 1 ? -1 : 1;
        let x = 2 ** idx * multiply * cur;
        return (acc += x);
      }, 0);

    const fractionTotal = fraction
      .replaceAll("-1", "A")
      .split("")
      .reduce((acc, cur, idx) => {
        let x = 0.5 ** (idx + 1) * (cur == "A" ? -1 : cur);
        return (acc += x);
      }, 0);

    return integerTotal + fractionTotal;
  };

  /**
   * Shift to X = 2 * x in binary
   * binary:string -> 1000, 1000.0001, 0, 1 ...
   * length:number -> bit size
   */
  const shiftBinary = (binary = "", length = 1) => {
    binary = normalize(binary, length);

    const [integer, fraction] = binary.split("."); // Divide integer and fraction part

    const fractionPart = fraction.split(""); // Convert to array
    const integerPart = integer.split("");

    const fractionCarry = fractionPart.shift();
    integerPart.push(fractionCarry);

    return `${integerPart.join("").slice(1)}.${fractionPart.join("").padEnd(length, "0")}`;
  };

  const calc = () => {
    // Values
    const dividend = document.getElementById("input-X").value; // X or N
    const divisior = document.getElementById("input-D").value; // D
    const bitLength = document.getElementById("input-m").value; // m
    const iterationCount = document.getElementById("input-n").value; // n

    algorithmA(dividend, divisior, bitLength, iterationCount);
    algorithmB(dividend, divisior, bitLength, iterationCount);
  };

  const algorithmA = (dividend, divisior, bitLength, iterationCount) => {
    // Properties
    let htmlLog = getLineBreak();
    let operationCount = 0;
    let xBinary = convertDecimalToBinary(dividend, bitLength);
    let dBinary = convertDecimalToBinary(divisior, bitLength);
    let dComplementBinary = complement(dBinary, bitLength);
    let r = xBinary; // Remainder = r0,r1,r2 ...
    let m = bitLength;
    let n = iterationCount;
    let q = []; // Quotient

    htmlLog += log("Values");
    htmlLog += getLineBreak();
    htmlLog += log("Bit Length   m\t\t", m);
    htmlLog += log("Iteration    n\t\t", n);
    htmlLog += log("Dividend     X or N\t", xBinary, "\t=\t", dividend);
    htmlLog += log("Divisior     D\t\t", dBinary, "\t=\t", divisior);
    htmlLog += log("Divisior    -D\t\t", dComplementBinary, "\t=\t", -1 * divisior);
    htmlLog += getLineBreak();

    for (let i = 0; i <= n; i++) {
      const _2r = shiftBinary(r, m);

      htmlLog += log(`r<sub>${i}</sub>\t\t\t`, r);
      if (i == n) {
        break;
      }
      let qBit;

      if (_2r[0] == dBinary[0]) {
        qBit = 1;
      } else {
        qBit = -1;
      }
      q.push(qBit);

      htmlLog += log(`2r<sub>${i}</sub>\t\t\t`, _2r, `\t\tq<sub>${i}</sub> = ${qBit}`);
      htmlLog += log(`Add ${qBit == 1 ? "-" : ""}D\t\t\t`, qBit == 1 ? dComplementBinary : dBinary);
      htmlLog += getLineBreak();
      r = calculate(_2r, qBit == 1 ? dComplementBinary : dBinary, m, 2);
      operationCount++;
    }

    const bigR = convertBinaryToDecimal(r) * 0.5 ** n;
    const bigQ = convertBinaryToDecimal(`0.${q.join("")}`);

    document.getElementById("logA").innerHTML = htmlLog;
    htmlLog = "";
    htmlLog += log(`R = r<sub>${n}</sub> * 2<sup>-${n}</sup> = ${r} * 2<sup>-${n}</sup> =`, convertBinaryToDecimal(r), ` * 2<sup>-${n}</sup> = `, bigR);
    // if (bigQ >= 0) {
    //   htmlLog += log("Q = 0.", q.join(""), " = ", bigQ);
    // } else {
    //   htmlLog += log("Q = 0.", q.join(""), " = ", bigQ, " = ", convertDecimalToBinary(bigQ, m), " = ", bigQ * -1);
    //   bigQ *= -1;
    // }
    htmlLog += log("Q = 0.", q.join(""), " = ", bigQ);
    htmlLog += log(`X = Q * D + R = ${bigQ} * ${divisior} + ${bigR} = `, bigQ * divisior + bigR);
    htmlLog += log("Execution Time = ~", _algorithmA(dividend, divisior, m, iterationCount)[0], " ms");
    htmlLog += log("Operation Count (Addition/Subtraction) = ", operationCount);
    document.getElementById("resultLogA").innerHTML = htmlLog;
  };

  const _algorithmA = (dividend, divisior, bitLength, iterationCount) => {
    // Properties
    /**
     * r(i) = 2r(i-1) -D
     */
    let xBinary = convertDecimalToBinary(dividend, bitLength);
    let dBinary = convertDecimalToBinary(divisior, bitLength);
    let dComplementBinary = complement(dBinary, bitLength);
    let r = xBinary; // Remainder = r0,r1,r2 ...
    let m = bitLength;
    let n = iterationCount;
    let q = []; // Quotient
    let operationCount = 0;

    const startTime = performance.now();
    for (let i = 0; i < n; i++) {
      const _2r = shiftBinary(r, m);

      let qBit;

      if (_2r[0] == dBinary[0]) {
        qBit = 1;
      } else {
        qBit = -1;
      }
      q.push(qBit);

      r = calculate(_2r, qBit == 1 ? dComplementBinary : dBinary, m, 2);

      operationCount++;
    }
    const endTime = performance.now();

    return [endTime - startTime, operationCount];
  };

  const algorithmB = (dividend, divisior, bitLength, iterationCount) => {
    let operationCount = 0;
    let htmlLog = getLineBreak();
    let xBinary = convertDecimalToBinary(dividend, bitLength);
    let dBinary = convertDecimalToBinary(divisior, bitLength);
    let dComplementBinary = complement(dBinary, bitLength);
    let r = xBinary; // Remainder = r0,r1,r2 ...
    let m = iterationCount;
    let n = bitLength;
    let q = []; // Quotient

    htmlLog += log("Values");
    htmlLog += getLineBreak();
    htmlLog += log("Bit Length   m\t\t", m);
    htmlLog += log("Iteration    n\t\t", n);
    htmlLog += log("Dividend     X or N\t", xBinary, "\t=\t", dividend);
    htmlLog += log("Divisior     D\t\t", dBinary, "\t=\t", divisior);
    htmlLog += log("Divisior    -D\t\t", dComplementBinary, "\t=\t", -1 * divisior);
    htmlLog += getLineBreak();

    for (let i = 0; i <= m; i++) {
      const _2r = shiftBinary(r, n);

      htmlLog += log(`r<sub>${i}</sub>\t\t\t`, r);
      if (i == m) {
        break;
      }

      let qBit = 0;
      let cmp = calculate(_2r, dComplementBinary, n, 2);
      if (cmp[0] == "0") {
        qBit = 1;
      }

      cmp = calculate(_2r, dBinary, n, 2);
      if (cmp[0] == "1") {
        qBit = -1;
      }

      q.push(qBit);

      htmlLog += log(`2r<sub>${i}</sub>\t\t\t`, _2r, `\t\tq<sub>${i}</sub> = ${qBit}`);

      if (qBit != 0) {
        htmlLog += log(`Add ${qBit == 1 ? "-" : ""}D\t\t\t`, qBit == 1 ? dComplementBinary : dBinary);
        htmlLog += getLineBreak();
        r = calculate(_2r, qBit == 1 ? dComplementBinary : dBinary, n, 2);
        operationCount++;
      } else {
        r = _2r;
      }
    }

    const bigR = convertBinaryToDecimal(r) * 0.5 ** n;
    const bigQ = convertBinaryToDecimal(`0.${q.join("")}`);

    document.getElementById("logB").innerHTML = htmlLog;
    htmlLog = "";
    htmlLog += log(`R = r<sub>${n}</sub> * 2<sup>-${n}</sup> = ${r} * 2<sup>-${n}</sup> =`, convertBinaryToDecimal(r), ` * 2<sup>-${n}</sup> = `, bigR);
    htmlLog += log("Q = 0.", q.join(""), " = ", bigQ);
    htmlLog += log(`X = Q * D + R = ${bigQ} * ${divisior} + ${bigR} = `, bigQ * divisior + bigR);
    htmlLog += log("Execution Time = ~", _algorithmB(dividend, divisior, bitLength, iterationCount)[0], " ms");
    htmlLog += log("Operation Count (Addition/Subtraction) = ", operationCount);
    document.getElementById("resultLogB").innerHTML = htmlLog;
  };

  const _algorithmB = (dividend, divisior, bitLength, iterationCount) => {
    let operationCount = 0;
    let xBinary = convertDecimalToBinary(dividend, bitLength);
    let dBinary = convertDecimalToBinary(divisior, bitLength);
    let dComplementBinary = complement(dBinary, bitLength);
    let r = xBinary; // Remainder = r0,r1,r2 ...
    let m = iterationCount;
    let n = bitLength;
    let q = []; // Quotient

    const startTime = performance.now();
    for (let i = 0; i < m; i++) {
      const _2r = shiftBinary(r, n);

      let qBit = 0;
      let cmp = calculate(_2r, dComplementBinary, n, 2);
      if (cmp[0] == "0") {
        qBit = 1;
      }

      cmp = calculate(_2r, dBinary, n, 2);
      if (cmp[0] == "1") {
        qBit = -1;
      }

      q.push(qBit);
      if (qBit != 0) {
        r = calculate(_2r, qBit == 1 ? dComplementBinary : dBinary, n, 2);
        operationCount++;
      } else {
        r = _2r;
      }
    }
    const endTime = performance.now();

    return [endTime - startTime, operationCount];
  };

  function decimalPlaces(number) {
    var parts = (number + "").split(".");
    return parts.length > 1 ? parts[1].length : 0;
  }

  function wholeNumberMultiple(numbers) {
    return Math.max(...numbers.map((n) => decimalPlaces(n)));
  }

  function randomIntInSteps(a, b, step) {
    function randomInt(a, b) {
      return Math.floor(Math.random() * (b - a + 1) + a);
    }

    if (a > b) {
      // Ensure a is smaller.
      var c = a;
      a = b;
      b = c;
    }

    step = Math.abs(step);

    return a + randomInt(0, Math.floor((b - a) / step)) * step;
  }

  /**
   * 
   * @param {*} a Min
   * @param {*} b Max 
   * @param {*} step Step
   * @returns Random number
   */
  function randomNumber(a, b, step) {
    var multiple = Math.pow(10, wholeNumberMultiple([a, b]));
    return randomIntInSteps(a * multiple, b * multiple, step * multiple) / multiple;
  }

  const performanceAnalysis = () => {
    // Values
    const randomCount = 10;
    const dividend = Array.from({ length: randomCount }).map((i) => randomNumber(0.15, 1000, 0.25)); // X or N
    const divisior = Array.from({ length: randomCount }).map((i) => randomNumber(0.15, 1000, 0.25)); // D
    const bitLength = 4; // m
    const iterationCount = 4; // n

    let totalExecTimeA = 0;
    let totalExecTimeB = 0;
    let totalOpCountA = 0;
    let totalOpCountB = 0;
    let htmlLog = "";

    for (let i = 0; i < randomCount; i++) {
      const msA = _algorithmA(dividend[i], divisior[i], bitLength, iterationCount);
      const msB = _algorithmB(dividend[i], divisior[i], bitLength, iterationCount);

      totalExecTimeA += msA[0];
      totalExecTimeB += msB[0];
      totalOpCountA += msA[1];
      totalOpCountB += msB[1];

      htmlLog += log(`Execution Time X: ${dividend[i]} D: ${divisior[i]}\t\t= ~`, msA[0], " ms");
      htmlLog += log(`Execution Time X: ${dividend[i]} D: ${divisior[i]}\t\t= ~`, msB[0], " ms");
    }

    htmlLog += getLineBreak();
    htmlLog += log(`Total Execution Time  (A)\t\t\t = ~`, totalExecTimeA, " ms");
    htmlLog += log(`Total Execution Time  (B)\t\t\t = ~`, totalExecTimeB, " ms");
    htmlLog += log(`Total Operation Count (A)\t\t\t =  `, totalOpCountA);
    htmlLog += log(`Total Operation Count (B)\t\t\t =  `, totalOpCountB);

    document.getElementById("resultPerformanceLog").innerHTML = htmlLog;
  };

  const log = (...data) => {
    console.log(...data);
    return `<span class="d-block">${data.join("")}</span>`;
  };

  const getLineBreak = () => {
    return '<span class="d-block my-2 me-5" style="border-bottom: 1px solid black;"></span>';
  };

  const init = () => {
    document.querySelector("#performance-analysis").addEventListener("click", () => {
      performanceAnalysis();
    });

    document.querySelector("button").addEventListener("click", () => {
      calc();
    });

    calc();
  };

  init();
})();
