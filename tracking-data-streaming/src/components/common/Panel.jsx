// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import Container from "@cloudscape-design/components/container";
import styles from "./Panel.module.css";

// Popup panel
const Panel = ({ header, footer, children }) => {
  return (
    <div className={styles.wrapper}>
      <Container>
        <div className={styles.header}>{header}</div>
        <div className={styles.content}>{children}</div>
        <div className={styles.footer}>{footer}</div>
      </Container>
    </div>
  );
};

export default Panel;
