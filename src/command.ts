/**
 *
 * @param cmd 命令
 * @param args 参数
 * @returns stdout.trim()
 */
export const execute = async (cmd: string, args: string[]) => {
  const { execa } = await import('execa')
  const res = await execa(cmd, args)
  return res.stdout.trim()
}
