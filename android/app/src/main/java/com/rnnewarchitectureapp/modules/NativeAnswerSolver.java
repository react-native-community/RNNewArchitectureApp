package com.rnnewarchitectureapp.modules;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.rnnewarchitectureapp.codegen.NativeAnswerSolverSpec;

public class NativeAnswerSolver extends NativeAnswerSolverSpec {

    public static final String NAME = "NativeAnswerSolver";

    public NativeAnswerSolver(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public double answerTheUltimateQuestion(String input) {
        return 42.0;
    }

    @NonNull
    @Override
    public String getName() {
        return NAME;
    }
}
