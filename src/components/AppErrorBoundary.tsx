import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors, FontSizes, Radii, Spacing } from "../constants/theme";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * Beklenmeyen render hatalarında uygulamanın boş ekranda kalmaması için.
 */
export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || "Bilinmeyen hata" };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (__DEV__) {
      console.error("[AppErrorBoundary]", error, info.componentStack);
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, message: "" });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.wrap}>
          <Text style={styles.title}>Bir şeyler ters gitti</Text>
          <Text style={styles.body}>
            Uygulama beklenmedik şekilde durdu. Tekrar dene; sorun sürerse uygulamayı
            kapatıp aç.
          </Text>
          {__DEV__ && this.state.message ? (
            <Text style={styles.devHint} numberOfLines={4}>
              {this.state.message}
            </Text>
          ) : null}
          <TouchableOpacity
            style={styles.btn}
            onPress={this.handleRetry}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>Tekrar dene</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "center",
    padding: Spacing.xl,
    backgroundColor: Colors.bg,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  body: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  devHint: {
    fontSize: FontSizes.xs,
    color: Colors.coral,
    marginBottom: Spacing.md,
  },
  btn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: Radii.button,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: FontSizes.md,
  },
});
