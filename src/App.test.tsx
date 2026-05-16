import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

async function createDemoVault(user: ReturnType<typeof userEvent.setup>) {
  render(<App />);

  await user.type(screen.getByLabelText("主密码"), "master-pass");
  await user.click(screen.getByRole("button", { name: "创建保险库" }));

  expect(await screen.findByRole("button", { name: "账号密码" })).toBeInTheDocument();
}

async function addPassword(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "新增条目" }));

  const form = screen.getByRole("form", { name: "新增条目" });
  await user.type(within(form).getByLabelText("标题"), "Gmail");
  await user.type(within(form).getByLabelText("网站"), "https://mail.google.com");
  await user.type(within(form).getByLabelText("用户名"), "me@example.com");
  await user.type(within(form).getByLabelText("密码"), "secret-pass");
  await user.click(within(form).getByRole("button", { name: "保存条目" }));
}

async function addApiKey(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "新增条目" }));

  const form = screen.getByRole("form", { name: "新增条目" });
  await user.selectOptions(within(form).getByLabelText("类型"), "api-key");
  await user.type(within(form).getByLabelText("标题"), "OpenAI API Key");
  await user.type(within(form).getByLabelText("服务商"), "OpenAI");
  await user.type(within(form).getByLabelText("Key"), "sk-test");
  await user.type(within(form).getByLabelText("环境变量"), "OPENAI_API_KEY");
  await user.type(within(form).getByLabelText("项目"), "Prototype");
  await user.type(within(form).getByLabelText("过期时间"), "2026-12-31");
  await user.click(within(form).getByRole("button", { name: "保存条目" }));
}

describe("MVP local vault flow", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates a vault and adds a password entry", async () => {
    const user = userEvent.setup();
    await createDemoVault(user);
    await addPassword(user);

    expect(await screen.findAllByText("Gmail")).toHaveLength(2);
    expect(screen.queryByText("secret-pass")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "显示 密码" }));
    expect(screen.getByText("secret-pass")).toBeInTheDocument();
  });

  it("adds an API key and copies the env line", async () => {
    const user = userEvent.setup();
    await createDemoVault(user);
    await addApiKey(user);

    expect(await screen.findAllByText("OpenAI API Key")).toHaveLength(2);
    expect(screen.getAllByText("OPENAI_API_KEY").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "复制 .env" }));
    expect(await screen.findByText("已复制 .env 行")).toBeInTheDocument();
  });

  it("moves an entry to trash, restores it, and permanently deletes it", async () => {
    const user = userEvent.setup();
    await createDemoVault(user);
    await addPassword(user);

    await user.click(screen.getByRole("button", { name: "移到回收站" }));
    expect(await screen.findByText("已移到回收站")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "恢复条目" }));
    expect(await screen.findByText("已恢复条目")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "移到回收站" }));
    await user.click(screen.getByRole("button", { name: "永久删除" }));
    expect(await screen.findByText("已永久删除")).toBeInTheDocument();
    expect(screen.getByText("没有匹配的条目")).toBeInTheDocument();
  });

  it("shows settings and locks the vault", async () => {
    const user = userEvent.setup();
    await createDemoVault(user);

    await user.click(screen.getByRole("button", { name: "设置" }));
    expect(screen.getByLabelText("剪贴板清除秒数")).toHaveValue(60);
    await user.clear(screen.getByLabelText("自动锁定分钟数"));
    await user.type(screen.getByLabelText("自动锁定分钟数"), "5");
    expect(screen.getByLabelText("自动锁定分钟数")).toHaveValue(5);

    await user.click(screen.getByRole("button", { name: "锁定保险库" }));
    expect(await screen.findByRole("button", { name: "打开保险库" })).toBeInTheDocument();
  });

  it("edits an existing password entry and can generate a replacement password", async () => {
    const user = userEvent.setup();
    await createDemoVault(user);
    await addPassword(user);

    await user.click(screen.getByRole("button", { name: "编辑条目" }));
    const form = screen.getByRole("form", { name: "编辑条目" });
    await user.clear(within(form).getByLabelText("标题"));
    await user.type(within(form).getByLabelText("标题"), "GitHub");
    await user.clear(within(form).getByLabelText("用户名"));
    await user.type(within(form).getByLabelText("用户名"), "dev@example.com");
    await user.click(within(form).getByRole("button", { name: "生成密码" }));
    const generated = within(form).getByLabelText("密码") as HTMLInputElement;
    expect(generated.value.length).toBeGreaterThanOrEqual(16);
    await user.click(within(form).getByRole("button", { name: "保存修改" }));

    expect(await screen.findByText("已更新条目")).toBeInTheDocument();
    expect(screen.getAllByText("GitHub")).toHaveLength(2);
    expect(screen.queryByText("Gmail")).not.toBeInTheDocument();
    expect(screen.getAllByText("dev@example.com").length).toBeGreaterThan(0);
  });

  it("keeps recent vaults on the lock screen for desktop use", async () => {
    const user = userEvent.setup();
    await createDemoVault(user);

    await user.click(screen.getByRole("button", { name: "设置" }));
    await user.click(screen.getByRole("button", { name: "锁定保险库" }));

    expect(await screen.findByText("最近保险库")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "demo.kdbx" })).toBeInTheDocument();
  });
});
