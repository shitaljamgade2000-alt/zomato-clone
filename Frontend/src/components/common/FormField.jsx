export default function FormField({ label, name, type = 'text', formik, as = 'input', rows, placeholder }) {
  const error = formik.touched[name] && formik.errors[name];
  const InputTag = as;

  return (
    <div className="input-group">
      <label className="input-label" htmlFor={name}>
        {label}
      </label>
      <InputTag
        id={name}
        name={name}
        type={type}
        className="input-field"
        placeholder={placeholder}
        rows={rows}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      {error && <div className="field-error">{error}</div>}
    </div>
  );
}
