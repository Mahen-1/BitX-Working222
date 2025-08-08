import * as React from "react";

export function Tabs({ children, defaultValue }) {
  const [activeTab, setActiveTab] = React.useState(defaultValue);
  return <div>{React.Children.map(children, child => {
    if (child.type === TabsList) {
      return React.cloneElement(child, { activeTab, setActiveTab });
    }
    if (child.type === TabsContent && child.props.value === activeTab) {
      return child;
    }
    return null;
  })}</div>;
}

export function TabsList({ children, activeTab, setActiveTab }) {
  return (
    <div className="flex border-b border-gray-300">
      {React.Children.map(children, child =>
        React.cloneElement(child, { activeTab, setActiveTab })
      )}
    </div>
  );
}

export function TabsTrigger({ value, children, activeTab, setActiveTab }) {
  const active = activeTab === value;
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`px-4 py-2 border-b-2 ${active ? "border-blue-500 text-blue-500" : "border-transparent text-gray-500"}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children }) {
  return <div className="p-4">{children}</div>;
}
