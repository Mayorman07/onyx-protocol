import { ROLE_FIELDS, type Role } from "./role-fields";

/** Uncontrolled inputs for every role field. Change `key` on the parent to reset them to new values. */
export function RoleInputs({ values }: { values: Role }) {
  return ROLE_FIELDS.map((field) => (
    <label className="field" key={field.name}>
      <span>
        {field.label}
        {!field.required && <em className="optional"> (optional)</em>}
      </span>
      {field.long ? (
        <textarea name={field.name} defaultValue={values[field.name] ?? ""} required={field.required} rows={3} />
      ) : (
        <input
          name={field.name}
          type="text"
          defaultValue={values[field.name] ?? ""}
          required={field.required}
          pattern={field.name === "codename" ? "[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*" : undefined}
          autoCapitalize={field.name === "codename" ? "none" : undefined}
        />
      )}
    </label>
  ));
}
