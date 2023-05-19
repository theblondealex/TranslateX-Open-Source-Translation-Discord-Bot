let x = 400;
for (let index = 0; index <= 96; index++) {
  x = x * 1.05 + 400;
  console.log(`Month ${index} : balance = ${x}`);
}
