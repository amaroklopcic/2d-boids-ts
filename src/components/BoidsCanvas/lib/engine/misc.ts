export async function sleep(ms: number) {
  await new Promise((res) => setTimeout(res, ms));
}

export const whileGenerator = function* () {
  let count = 0;
  while (true) {
    yield count++;
  }
};
